import { Hono } from "hono";


const health = new Hono ( );

health.get('/', (c) =>{
   return c.json({
      success:true,
      service:'PingLiteUbetatta',
      version:'1.0.1',
      status:'anemanda htto',
      timeStamp:new Date().toISOString()
   });
});

export default health;