# TestFlight / App Store submission

## Before you build (App Store Connect)

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr)
2. In [App Store Connect](https://appstoreconnect.apple.com):
   - **My Apps → + → New App**
   - Platform: iOS
   - Name: **MonkeyMac**
   - Bundle ID: **com.monkeymac.app** (register under Certificates, Identifiers & Profiles if needed)
   - SKU: `monkeymac` (any unique string)
3. Note your **Apple Team ID** (developer.apple.com → Membership)
4. Note **App Store Connect App ID** (numeric ID in App URL, e.g. `1234567890`)

## Build on EAS (cloud)

```bash
cd mobile
npm install
eas build --platform ios --profile production
```

First run links the Expo project and sets up signing (follow prompts for Apple login).

## Submit to TestFlight

After the build finishes:

```bash
eas submit --platform ios --latest
```

Or build + submit in one step:

```bash
eas build --platform ios --profile production --auto-submit
```

Update `eas.json` → `submit.production.ios` with your `appleTeamId` and `ascAppId` to skip some prompts.

## App Store Connect checklist

- [ ] Privacy Policy URL (required for submission — can be a simple GitHub page or your site)
- [ ] App Privacy questionnaire (no data collection for this local-only app)
- [ ] Screenshots (6.7" iPhone required for TestFlight external testing later)
- [ ] Export compliance: app uses standard encryption only → answer **No** for custom encryption (`ITSAppUsesNonExemptEncryption` is already false in app.json)

## Bundle ID

`com.monkeymac.app` — must match exactly in App Store Connect and `app.json`.
