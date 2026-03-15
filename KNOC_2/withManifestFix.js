const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Fixes the manifest merger conflict between our AndroidManifest.xml and
 * the react-native-firebase_messaging library manifest.
 *
 * Both declare `com.google.firebase.messaging.default_notification_color`
 * with different values. Adding `tools:replace="android:resource"` tells
 * the Android manifest merger to use OUR value and ignore the library's.
 *
 * This plugin runs LAST (placed at end of plugins array in app.json) so it
 * patches the manifest after expo-notifications has added its meta-data.
 */
module.exports = function withManifestColorFix(config) {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults;

        // 1. Ensure the tools namespace is declared on the root <manifest> element
        if (!manifest.manifest.$['xmlns:tools']) {
            manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // 2. Fetch the main application
        const applications = manifest.manifest.application ?? [];
        for (const app of applications) {
            if (!app['meta-data']) {
                app['meta-data'] = [];
            }
            
            let foundIndex = -1;
            for (let i = 0; i < app['meta-data'].length; i++) {
                if (app['meta-data'][i].$['android:name'] === 'com.google.firebase.messaging.default_notification_color') {
                    foundIndex = i;
                    break;
                }
            }
            
            const newMetaData = {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_color',
                    'android:resource': '@color/notification_icon_color',
                    'tools:replace': 'android:resource'
                }
            };

            if (foundIndex > -1) {
                // Merge/Overwrite the existing element to preserve the tools attribute
                app['meta-data'][foundIndex] = newMetaData;
                console.log('[withManifestFix] ✅ Overwrote existing default_notification_color with tools:replace');
            } else {
                // Simply push a new one if not found
                app['meta-data'].push(newMetaData);
                console.log('[withManifestFix] ✅ Added new default_notification_color with tools:replace');
            }
        }

        return config;
    });
};
