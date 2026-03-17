const { withAndroidManifest, withAndroidStyles } = require('@expo/config-plugins');

/**
 * Fixes the manifest merger conflict between our AndroidManifest.xml and
 * the react-native-firebase_messaging library manifest.
 *
 * Both declare `com.google.firebase.messaging.default_notification_color`
 * with different values. Adding `tools:replace="android:resource"` tells
 * the Android manifest merger to use OUR value and ignore the library's.
 *
 * Also strips the native splash screen icon so only our custom
 * AppSplash.tsx is shown (no double-splash).
 *
 * This plugin runs LAST (placed at end of plugins array in app.json) so it
 * patches the manifest after expo-notifications has added its meta-data.
 */
module.exports = function withManifestColorFix(config) {
    // ── 1. Fix AndroidManifest.xml ──
    config = withAndroidManifest(config, (config) => {
        const manifest = config.modResults;

        // Ensure the tools namespace is declared on the root <manifest> element
        if (!manifest.manifest.$['xmlns:tools']) {
            manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // Fetch the main application
        const applications = manifest.manifest.application ?? [];
        for (const app of applications) {
            if (!app['meta-data']) {
                app['meta-data'] = [];
            }
            
            // Add or update color metadata
            let colorIndex = -1;
            for (let i = 0; i < app['meta-data'].length; i++) {
                if (app['meta-data'][i].$['android:name'] === 'com.google.firebase.messaging.default_notification_color') {
                    colorIndex = i;
                    break;
                }
            }
            
            const colorMetaData = {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_color',
                    'android:resource': '@color/notification_icon_color',
                    'tools:replace': 'android:resource'
                }
            };

            if (colorIndex > -1) {
                app['meta-data'][colorIndex] = colorMetaData;
            } else {
                app['meta-data'].push(colorMetaData);
            }

            // Add or update icon metadata
            let iconIndex = -1;
            for (let i = 0; i < app['meta-data'].length; i++) {
                if (app['meta-data'][i].$['android:name'] === 'com.google.firebase.messaging.default_notification_icon') {
                    iconIndex = i;
                    break;
                }
            }
            
            const iconMetaData = {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_icon',
                    'android:resource': '@drawable/notification_icon'
                }
            };

            // If Firebase library manifest happens to have it, replace it using tools:replace
            if (iconIndex > -1) {
                iconMetaData.$['tools:replace'] = 'android:resource';
                app['meta-data'][iconIndex] = iconMetaData;
            } else {
                app['meta-data'].push(iconMetaData);
            }
        }

        return config;
    });

    // ── 2. Fix styles.xml — remove native splash icon so only AppSplash.tsx shows ──
    config = withAndroidStyles(config, (config) => {
        const styles = config.modResults;

        // Find the Theme.App.SplashScreen style
        const resources = styles.resources;
        if (resources && resources.style) {
            for (const style of resources.style) {
                if (style.$.name === 'Theme.App.SplashScreen') {
                    // Change parent from Theme.SplashScreen to AppTheme
                    style.$.parent = 'AppTheme';

                    // Keep only the windowBackground item, remove all splash-specific items
                    style.item = [
                        {
                            $: { name: 'android:windowBackground' },
                            _: '@color/splashscreen_background',
                        },
                    ];
                }
            }
        }

        return config;
    });

    return config;
};
