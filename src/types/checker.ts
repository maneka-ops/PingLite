export interface CheckResult{
   url: string;
   online:boolean;
   status:number | null;
   statusText:string;
   responseTime:number|null;
   protocol:string;
   checkedAt:string;
   error?:string;
}

export interface ApiResponse<T>{
   success:boolean;
   data?:T;
   error?:string;
}