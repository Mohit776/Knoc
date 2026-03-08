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

        // 2. Walk all application entries (usually just one)
        const applications = manifest.manifest.application ?? [];
        for (const app of applications) {
            const metaDataList = app['meta-data'] ?? [];

            for (const meta of metaDataList) {
                if (
                    meta.$['android:name'] ===
                    'com.google.firebase.messaging.default_notification_color'
                ) {
                    // Add tools:replace so the manifest merger uses our value
                    meta.$['tools:replace'] = 'android:resource';
                    console.log(
                        '[withManifestFix] ✅ Added tools:replace to default_notification_color'
                    );
                }
            }
        }

        return config;
    });
};
