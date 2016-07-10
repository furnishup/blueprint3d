In general, follow the Google Javascript Style recommendations:

https://google.github.io/styleguide/javascriptguide.xml#JavaScript_Style_Rules

Highlights:

- use (two) spaces, not Tabs

- use lowercase for all TS files, use camelcase for the related TS types
  insert underscores in the filename for uppercases in the type name, such as

    HalfEdge -> half_edge.ts

- sequence of TS references:

  (1) External references
  (2) Internal references from other directories, alphabetically ordered
  (3) Internal references from the current directory, alphabetically ordered

  Sometimes, however, you need to modify this sequence to avoid bootstrap issues.

- place an empty line after the references
