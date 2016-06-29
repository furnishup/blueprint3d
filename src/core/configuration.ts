module BP3D.Core {
  /** Dimensioning in Inch. */
  export const dimInch: string = "inch";

  /** Dimensioning in Meter. */
  export const dimMeter: string = "m";

  /** Dimensioning in Centi Meter. */
  export const dimCentiMeter: string = "cm";

  /** Dimensioning in Milli Meter. */
  export const dimMilliMeter: string = "mm";

  /** Key for dimensiung unit. */
  const _dimUnit = "dimunit";

  /** Global configuration to customize the whole system.  */
  export class Configuration {
    /** Configuration data loaded from/stored to extern. */
    private static data: {[key: string]: any} = {
      _dimUnit: dimInch
    };

    // Dimensioning Unit:

    /** Set the dimensioning unit for the 2D floorplan. */
    public static setDimensioningUnit(unit: string) {
      this.data[_dimUnit] = unit;
    }

    /** Get the dimensioning unit for the 2D floorplan. */
    public static getDimensioningUnit(): string {
      return this.data[_dimUnit];
    }

  }
}