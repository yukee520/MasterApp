package com.facebook.react;

import android.app.Application;
import com.facebook.react.ReactPackage;
import java.util.ArrayList;
import java.util.List;

public class PackageList {
    private Application application;
    private ReactNativeHost reactNativeHost;

    public PackageList(ReactNativeHost reactNativeHost) {
        this.reactNativeHost = reactNativeHost;
        this.application = (Application) reactNativeHost.getApplication();
    }

    public List<ReactPackage> getPackages() {
        List<ReactPackage> packages = new ArrayList<>();
        // Add any custom packages here
        return packages;
    }
}
