package io.pocketexpense.app;

import android.app.AlertDialog;
import android.os.Debug;
import android.os.Bundle;
import android.provider.Settings;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean securityDialogVisible = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SmartDetectionPlugin.class);
        super.onCreate(savedInstanceState);
        enforceSecurityGuards();
    }

    @Override
    public void onResume() {
        super.onResume();
        enforceSecurityGuards();
    }

    private void enforceSecurityGuards() {
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );

        if (isUsbDebuggingEnabled() || Debug.isDebuggerConnected() || Debug.waitingForDebugger()) {
            blockAppForDebugging();
        }
    }

    private boolean isUsbDebuggingEnabled() {
        return Settings.Global.getInt(
            getContentResolver(),
            Settings.Global.ADB_ENABLED,
            0
        ) == 1;
    }

    private void blockAppForDebugging() {
        if (securityDialogVisible || isFinishing()) {
            return;
        }

        securityDialogVisible = true;

        new AlertDialog.Builder(this)
            .setTitle("Security protection enabled")
            .setMessage("Pocket Money cannot be used while USB debugging or a debugger is active. Please turn off USB debugging and reopen the app.")
            .setCancelable(false)
            .setPositiveButton("Close App", (dialog, which) -> {
                securityDialogVisible = false;
                finishAffinity();
            })
            .setOnDismissListener(dialog -> securityDialogVisible = false)
            .show();
    }
}
