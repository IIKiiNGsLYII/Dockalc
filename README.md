# Dockalc

A modern desktop calculator for Windows and Mac, with unit and currency conversion, finance tools, and unlockable milestones.

## Download

Get the latest version from the **[Releases page](https://github.com/IIKiiNGsLYII/dockalc/releases/latest)**:

- **Windows:** download `Dockalc Setup` (the `.exe` file) and run it.
- **Mac:** download the `.dmg` file, open it, and drag Dockalc into your Applications folder. It works on both Apple Silicon and Intel Macs.

## First launch

Dockalc isn't signed with a paid developer certificate yet, so Windows and macOS show a security warning the first time you open it. The app is safe to open, and here is how to get past the warning.

**Windows**

1. If you see "Windows protected your PC", click **More info**.
2. Click **Run anyway**.

**Mac**

1. Open Dockalc from your Applications folder. macOS will say it can't be opened.
2. Go to **System Settings → Privacy & Security**, scroll down to the Security section, and click **Open Anyway** next to the Dockalc message. Enter your password when asked.
3. If macOS says the app is "damaged", open Terminal and run this once, then try again:

   ```
   xattr -cr /Applications/Dockalc.app
   ```

## Privacy

Your settings and progress are stored on your own computer. The app connects to the internet only to fetch currency exchange rates.

## Support

If you enjoy Dockalc, you can [buy me a coffee](https://buymeacoffee.com/dockalc).

## License

Dockalc is free to download and run for personal or internal use. The source code is visible for reference only and is not licensed for copying, modification, or redistribution. See [LICENSE.txt](LICENSE.txt) for the full terms.

Copyright (c) 2026 Jacob D. All rights reserved.

## Credits

Currency exchange rates are provided by [Rates By Exchange Rate API](https://www.exchangerate-api.com).
