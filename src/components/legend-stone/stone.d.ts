
declare namespace LegendStone {
  export interface StoneMeta {
    uri: string,
    name: string
  }
  export interface StoneCost {
    stone: LegendStone.StoneMeta,
    cost: number,
    gm: number,
    still: number
  }
}