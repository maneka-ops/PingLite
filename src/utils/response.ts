import type { Context } from "hono";
import { error } from "node:console";

export function success<T>(c: Context, data:T){
   return c.json({
      success:true,
      data
   },200);
}

export function failure(
   c:Context,
   message:string,
   status:400|429|500=400

){
   return c.json({
      success:false,
      error:message
},status);
}