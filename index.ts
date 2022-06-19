import { createLogger, format, Logger, transports } from "winston";

const { combine } = format;

export const enum LogLevelEnum {
    Debug = "DEBUG",
    Info = "INFO",
    Warn = "WARN",
    Error = "ERROR",
}

export const enum LogStatusEnum {
    Success = 'SUCCESS',
    Fail = 'FAIL'
}

export interface DataFields {
    error?: string,
    status?: LogStatusEnum,
    fullMessage?: string,
    attachedObject?: string,
    objectDescription?: string,
}

export interface LogContentFormat {
    timestamp?: string;
    service_name?: string;
    severity: LogLevelEnum;
    environment?: string;
    component?: string;
    description?: string;
    data: DataFields;
}

export interface ILoggerData {
    moduleName: string;
    logContentFormat: any;
    logLevel: LogLevelEnum;
}


const loggerData: ILoggerData = {
    moduleName: '',
    logContentFormat: {},
    logLevel: LogLevelEnum.Debug
}

export default class WinstonLog {
    moduleName: string = loggerData.moduleName;
    subModuleName: string;
    winstonLogger: Logger;
    logFormat: any;
    logContentFormat: any = loggerData.logContentFormat;
    logLevel: LogLevelEnum = loggerData.logLevel;

    constructor(subModuleName: string) {
        this.subModuleName = subModuleName;
        this.logFormat = combine(format.json());
        this.logContentFormat = loggerData.logContentFormat;
        this.winstonLogger = createLogger({
            level: this.logLevel,
            format: this.logFormat,
            transports: [new transports.Console()],
        });
    }

    debug(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Debug, Title, Data);
    }
    info(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Info, Title, Data);
    }
    warn(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Warn, Title, Data);
    }
    error(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Error, Title, Data);
    }

    private log(Level: LogLevelEnum, Title: string, Data: DataFields) {
        const content: LogContentFormat = {
            timestamp: new Date().toISOString(),
            service_name: this.moduleName,
            component: this.subModuleName,
            severity: Level,
            environment: process.env.NODE_ENV || 'non-prod',
            description: Title,
            data: Data,
        };
        this.routeLoggerLogLevel(Level, content);
    }

    routeLoggerLogLevel = (level: LogLevelEnum, content: LogContentFormat) => {
        switch (level) {
            case LogLevelEnum.Debug:
                this.winstonLogger.debug(content);
                break;
            case LogLevelEnum.Info:
                this.winstonLogger.info(content);
                break;
            case LogLevelEnum.Error:
                this.winstonLogger.error(content);
                break;
            case LogLevelEnum.Warn:
                this.winstonLogger.warn(content);
                break;
            default:
                this.winstonLogger.debug(content);
        }
    };
}

export const loggerInit = (moduleName, logFormat, logLevel) => {
    loggerData.moduleName = moduleName;
    loggerData.logContentFormat = logFormat;
    loggerData.logLevel = logLevel;
}

export const getLogger = (subModuleName: string) => {
    return new WinstonLog(subModuleName);
}
