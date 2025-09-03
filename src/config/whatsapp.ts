import axios from "axios";
import dotenv from "dotenv";
import errorResponseHandler from "@middlewares/axiosMiddleware";

dotenv.config();

const waCloudApiURL: string | undefined = process.env.WA_CLOUD_API_URL;
const waCloudApiVersion: string | undefined = process.env.WA_CLOUD_API_VERSION;
let baseURL: string | undefined = `${waCloudApiURL}/${waCloudApiVersion}`;
const token: string | undefined = process.env.WA_CLOUD_API_ACCESS_TOKEN;
const waPhoneNumberId: string | number = process.env.WA_PHONE_NUMBER_ID || "400686439798296";

const axiosInstance = (withPhoneNumberId: boolean = true) => {
  const instance = axios.create({
    baseURL: withPhoneNumberId ? `${baseURL}/${waPhoneNumberId}` : baseURL,
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        const bearerToken = `Bearer ${token}`;
        config.headers.Authorization = bearerToken;
      }
      return config;
    },
    (error) => {
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
