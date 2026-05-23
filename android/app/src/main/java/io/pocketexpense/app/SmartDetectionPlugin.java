package io.pocketexpense.app;

import android.content.ComponentName;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SmartDetection")
public class SmartDetectionPlugin extends Plugin {
    private static SmartDetectionPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        getActivity().startActivity(intent);

        JSObject result = new JSObject();
        result.put("openedSettings", true);
        result.put("enabled", isListenerEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        result.put("enabled", isListenerEnabled());
        call.resolve(result);
    }

    static void emitNotification(String packageName, String title, String text, long postedAt) {
        if (instance == null || TextUtils.isEmpty(text)) {
            return;
        }

        JSObject data = new JSObject();
        data.put("packageName", packageName);
        data.put("title", title);
        data.put("text", text);
        data.put("postedAt", postedAt);
        instance.notifyListeners("transactionNotification", data);
    }

    private boolean isListenerEnabled() {
        String enabledListeners = Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );

        if (enabledListeners == null) {
            return false;
        }

        ComponentName componentName = new ComponentName(getContext(), SmartNotificationListenerService.class);
        return enabledListeners.toLowerCase().contains(componentName.flattenToString().toLowerCase());
    }
}
