# ACHILLES mobile app (Expo / React Native)

Customer app for iOS and Android. It uses the same Vercel website and Airtable database
through the website's API (`/api/products`, `/api/checkout`, `/api/mobile/*`).

## Try it on your phone right now (iOS and Android)
1. Install **Expo Go** from the App Store / Play Store.
2. `cd mobile && npx expo start` and scan the QR code.

By default the app talks to https://achiles-omega.vercel.app (the mobile API routes must be deployed).
To test against your PC instead: `set EXPO_PUBLIC_API_URL=http://<your-pc-ip>:3000` before `npx expo start`.

## Build the Android APK
```
npm i -g eas-cli
eas login
eas build -p android --profile preview
```
Download the .apk from the link EAS prints, upload it somewhere public (or `public/achilles.apk`),
then set `NEXT_PUBLIC_APK_URL` in Vercel (for example `/achilles.apk`) so "Get App" links to it.

## iOS
Installing on iPhones outside the App Store needs an Apple Developer account ($99/year):
`eas build -p ios` then submit to TestFlight / App Store. Until then, iPhone users use the website's
"Add to Home Screen" install (see /get).
