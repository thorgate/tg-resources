<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Changelog

- [v1.0.0](#v100)
- [v0.3.3](#v033)
- [v0.3.1](#v031)
- [v0.3.0](#v030)
- [v0.2.4](#v024)
- [v0.1.0](#v010)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### v1.0.0

**v1.0.0 introduces breaking changes**

 * Support react native (see #2)
 * Error handling changes (see #3)
 * No global configuration anymore **TODO**
 * Misc
  * Use babel 6 for building
  * Reduce dependency count
   * Use `lodash.template` instead of depending on full lodash

#### Migrating to 1.0.0

TODO: Describe the migration path

### v0.3.3

 * Lazy add extensions to ValidationError so importing early wont break extra fields.

### v0.3.1

  * Add ability to extend ValidationError

### v0.3.0

 * Now should be fully usable
 * Added `.del` method


### v0.2.4

 * Bugfixes & some docs
 * Added `put` requests
 * Fixed `mutateResponse`

### v0.1.0

  * tg-resources initial commit.
