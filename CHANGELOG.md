# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2020-11-10

### Added

- support edit of embedded documents (array of objects/Schemas)
- add tests
- improve README.md

## [1.2.0] - 2020-10-15

### Added

- audit log for create, edit, delete 🕺
    - can be turned off in global options `SchemaUI.init({ auditLog: false })`
    - typings also added
- improve tests

### BugFixes

- default boolean values were overridden
- reduce the use of lodash 👌

## [1.1.1] - 2020-05-08 

### Added

- typings are now available 

## [1.1.0] - 2020-05-08 

### Added

- add vuex state management
- abort background requests that threw errors
- support for permissions per model (create, read, edit, delete)
- search enhancements - possible to search in all fields that are string/objectIds
- improve & add tests

## BugFixes

- applying filters on a collection will take you to page no. 1
- create new document popup - fix transparent background while loading

## [1.0.4] - 2020-03-14 

### Added

- version indicator in the app bar
- dark mode

### Changed

- improve test coverage
- routesMap is now Map instead of Object

``
## [0.8.0] - 2020-02-15

Initial Version


[unreleased]: https://github.com/slocking/schemaui/compare/master...dev
[1.3.0]: https://github.com/slocking/schemaui/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/slocking/schemaui/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/slocking/schemaui/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/slocking/schemaui/compare/v1.0.5...v1.1.0
[1.0.4]: https://github.com/slocking/schemaui/compare/v0.8.0...v1.0.4
[0.8.0]: https://github.com/slocking/schemaui/compare/v0.8.0
