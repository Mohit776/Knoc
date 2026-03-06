const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withManifestColorFix(config) {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults;
        const app = manifest.manifest.application[0];

        // Add tools namespace
        if (!manifest.manifest.$['xmlns:tools']) {
            manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // Find the conflicting meta-data tag and add tools:replace
        if (app['meta-data']) {
            for (const meta of app['meta-data']) {
                if (meta.$['android:name'] === 'com.google.firebase.messaging.default_notification_color') {
                    meta.$['tools:replace'] = 'android:resource';
                }
            }
        }

        return config;
    });
};
