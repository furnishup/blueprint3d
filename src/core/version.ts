module BP3D.Core {
  /** Version information. */
  export class Version {
    /** The informal version. */
    public static getInformalVersion(): string {
      return "1.0 Beta 1";
    }

    /** The technical version. */
    public static getTechnicalVersion(): string {
      return "1.0.0.1"
    }
  }
}

console.log("Blueprint3D " + BP3D.Core.Version.getInformalVersion()
  + " (" + BP3D.Core.Version.getTechnicalVersion() + ")")