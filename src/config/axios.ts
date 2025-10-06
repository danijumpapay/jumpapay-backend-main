import axios from "axios";
import dotenv from "dotenv";
import errorResponseHandler from "@middlewares/axiosMiddleware";

dotenv.config();
const b2bHost: string | undefined = process.env.BOT_B2B_HOST;
const b2cHost: string | undefined = process.env.BOT_B2C_HOST;
const whatsappMiddlewareHost: string | undefined = process.env.WHATSAPP_MIDDLEWARE_HOST;

const axiosInstance = (botType: string) => {
  const instance = axios.create({
    baseURL: botType.toLowerCase() === "b2b" ? b2bHost : b2cHost,
  });

  instance.interceptors.response.use(
    (response) => response,
    errorResponseHandler,
  );

  return instance;
};

export const whatsappMiddlewareInstance = () => {
  const instance = axios.create({
    baseURL: whatsappMiddlewareHost,
  });

  instance.interceptors.request.use(
    (config) => {
      // const bearerToken = `Bearer ${token}`;
      // config.headers.Authorization = bearerToken;
      return config;
    },
    (error) => {
      console.log("WHATSAPP INSTANCE ERROR ======>", error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    errorResponseHandler,
  );

  return instance;
};

export default axiosInstance;
