/// <reference path="../core/configuration.ts" />

module BP3D.Dimensioning {

  /** Dimensioning in Inch. */
  export const dimInch: string = "inch";

  /** Dimensioning in Meter. */
  export const dimMeter: string = "m";

  /** Dimensioning in Centi Meter. */
  export const dimCentiMeter: string = "cm";

  /** Dimensioning in Milli Meter. */
  export const dimMilliMeter: string = "mm";

  /** Converts cm to dimensioning string.
   * @param cm Centi meter value to be converted.
   * @returns String representation.
   */
  export function cmToMeasure(cm: number): string {
    switch (Core.Configuration.getDimensioningUnit()) {
      case dimInch:
        var realFeet = ((cm * 0.393700) / 12);
        var feet = Math.floor(realFeet);
        var inches = Math.round((realFeet - feet) * 12);
        return feet + "'" + inches + '"';
      case dimMilliMeter:
        return "" + Math.round(10 * cm) + " mm";
      case dimCentiMeter:
        return "" + cm + " cm";
      case dimMeter:
      default:
        return "" + (0.01 * cm) + " m";
    }
  }
}