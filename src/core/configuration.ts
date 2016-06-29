/// <reference path="../utils/dimensioning.ts" />

module BP3D.Core {
  /** Key for dimensiung unit. */
  const dimUnit = "dimUnit";

  /** Global configuration to customize the whole system.  */
  export class Configuration {
    /** Configuration data loaded from/stored to extern. */
    private static data: {[key: string]: any} = {
      dimUnit: Dimensioning.dimInch
    };

    // Dimensioning Unit:

    /** Set the dimensioning unit for the 2D floorplan. */
    public static setDimensioningUnit(unit: string) {
      this.data[dimUnit] = unit;
    }

    /** Get the dimensioning unit for the 2D floorplan. */
    public static getDimensioningUnit(): string {
      return this.data[dimUnit];
    }
  }
}