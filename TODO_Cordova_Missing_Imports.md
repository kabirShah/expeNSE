# TODO: Fix missing module imports (@ionic-native/file/ngx, @awesome-cordova-plugins/social-sharing/ngx)

- [ ] Inspect installed packages state (node_modules present/absent) and dependency versions.
- [ ] Identify correct import style for the currently installed versions (Ionic Native v5 vs v6+, ngx wrappers availability).
- [ ] Update `src/app/app.module.ts` to use correct module providers/imports for the installed packages.
- [ ] Ensure Angular build uses compatible module format (Angular 18 + ionic/angular 8) and rerun `ng build`.
- [ ] If packages are missing, run clean install: delete lock/node_modules and reinstall.

