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
    service_name?: string,
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

export default class WinstonLog {
    subModuleName: string;
    winstonLogger: Logger;
    logFormat: any;

    constructor(subModuleName: string) {
        this.subModuleName = subModuleName;
        this.logFormat = combine(format.json());
        this.winstonLogger = createLogger({
            level: process.env.LOGGER_LEVEL,
            format: this.logFormat,
            transports: [new transports.Console()],
        });
    }

    debug(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Debug, Title, Data, Data?.service_name);
    }
    info(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Info, Title, Data ,Data?.service_name);
    }
    warn(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Warn, Title, Data, Data?.service_name);
    }
    error(Title: string, Data: DataFields = {}) {
        this.log(LogLevelEnum.Error, Title, Data, Data?.service_name);
    }

    private log(Level: LogLevelEnum, Title: string, Data: DataFields, service_name?: string) {
        const content: LogContentFormat = {
            timestamp: new Date().toISOString(),
            service_name: service_name ?? process.env.LOGGER_MODULE_NAME,
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

export const getLogger = (subModuleName: string) => {
    return new WinstonLog(subModuleName);
}
