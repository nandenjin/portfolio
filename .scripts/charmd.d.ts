import { Node } from "https://deno.land/x/charmd@v0.0.2/mod.ts"

declare module "https://deno.land/x/charmd@v0.0.2/mod.ts" {
  type Position = {
    line: number
    column: number
    offset: number
  }

  export type NodeFixed = Node & {
    position: {
      start: Position
      end: Position
    }
  }
}
