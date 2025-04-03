declare module "mongoose-gridfs" {
    import { Connection } from "mongoose";
  
    interface CreateModelOptions {
      modelName: string;
      connection: Connection;
    }
  
    interface GridFSModel {
      writeFile: (options: any, file: any, callback: (error: any, file: any) => void) => void;
      readFile: (options: any, callback: (error: any, file: any) => void) => void;
      findOne: (options: any, callback: (error: any, file: any) => void) => void;
    }
  
    export function createModel(options: CreateModelOptions): GridFSModel;
  }
  