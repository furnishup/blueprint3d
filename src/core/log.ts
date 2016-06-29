module BP3D.Core {

  /** Enumeration of log contexts. */
  export enum ELogContext {
    /** Log nothing. */
    None,

    /** Log all. */
    All,

    /** 2D interaction */
    Interaction2d,

    /** Interior items */
    Item,

    /** Wall (connectivity) */
    Wall,

    /** Room(s) */
    Room
  }

  /** Enumeration of log levels. */
  export enum ELogLevel {
    /** An information. */
    Information,

    /** A warning. */
    Warning,

    /** An error. */
    Error,

    /** A fatal error. */
    Fatal,

    /** A debug message. */
    Debug
  }

  /** The current log context. To be set when initializing the Application. */
  export var logContext: ELogContext = ELogContext.None;

  /** Pre-check if logging for specified context and/or level is enabled.
   * This may be used to avoid compilation of complex logs.
   * @param context The log context to be verified.
   * @param level The log level to be verified.
   * @returns If this context/levels is currently logged.
   */
  export function isLogging(context: ELogContext, level: ELogLevel) {
    return logContext === ELogContext.All || logContext == context
      || level === ELogLevel.Warning || level === ELogLevel.Error
      || level === ELogLevel.Fatal
  }

  /** Log the passed message in the context and with given level.
   * @param context The context in which the message should be logged.
   * @param level The level of the message.
   * @param message The messages to be logged. 
   */
  export function log(context: ELogContext, level: ELogLevel, message: string) {
    if (isLogging(context, level) === false) {
      return;
    }

    var tPrefix = "";
    switch (level) {
      case ELogLevel.Information:
        tPrefix = "[INFO_] ";
        break;
      case ELogLevel.Warning:
        tPrefix = "[WARNG] ";
        break;
      case ELogLevel.Error:
        tPrefix = "[ERROR] ";
        break;
      case ELogLevel.Fatal:
        tPrefix = "[FATAL] ";
        break;
      case ELogLevel.Debug:
        tPrefix = "[DEBUG] ";
        break;
    }

    console.log(tPrefix + message);
  }
}