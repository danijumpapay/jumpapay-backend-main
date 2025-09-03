import { Router } from "express";
import usersRoutes from "../v1/user/usersRoutes";
import userotpRoutes from "../v1/user/userotpRoutes";
import useractivitiesRoutes from "../v1/user/useractivitiesRoutes";
import usertokenRoutes from "../v1/user/usertokenRoutes";
import useremailsRoutes from "../v1/user/useremailsRoutes";
import usersosialmediaRoutes from "../v1/user/usersosialmediaRoutes";
import idcardsRoutes from "../v1/customer/idcardsRoute";
import vehiclesRoutes from "../v1/customer/vehiclesRoutes";
import stnkdocumentsRoutes from "../v1/customer/stnkdocumentsRoutes";
import bpkbdocumentsRoutes from "../v1/customer/bpkbdocumentsRoutes";
import addressesRoutes from "../v1/customer/addressesRoutes";
import vehicleimagesRoutes from "../v1/customer/vehicleimagesRoutes";
import citiesRoutes from "../v1/common/citiesRoutes";
import platesRoutes from "../v1/common/platesRoutes";
import vehicletypesRoutes from "../v1/common/vehicletypesRoutes";
import cityplatesRoutes from "../v1/common/cityplatesRoutes";
import companiesRoutes from "../v1/company/companiesRoutes";
import companywhatsappRoutes from "../v1/company/companywhatsappRoutes";
import companyemployeesRoutes from "../v1/company/companyemployeesRoutes";
import ordersRoutes from "../v1/transaction/ordersRoutes";
import orderaddressesRoutes from "../v1/transaction/orderaddressesRoutes";
import chatsRoutes from "@routes/v1/chats";
import messagesRoutes from "@routes/v1/messages";
import messageRoutes from "@routes/v1/message";
import merchantsRoutes from "@routes/v1/merchants";
import authRoutes from "./auth";

const router = Router();

router.use("/auth", authRoutes);

//#region - user
router.use("/users", usersRoutes);
router.use("/userotp", userotpRoutes);
router.use("/useractivities", useractivitiesRoutes);
router.use("/usertoken", usertokenRoutes);
router.use("/useremails", useremailsRoutes);
router.use("/usersosialmedia", usersosialmediaRoutes);
//#endregion - users

//#region - customer
router.use("/idcards", idcardsRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/stnkdocuments", stnkdocumentsRoutes);
router.use("/bpkbdocuments", bpkbdocumentsRoutes);
router.use("/addresses", addressesRoutes);
router.use("/vehicleimages", vehicleimagesRoutes);
//#endregion - customer

//#region - company
router.use("/companies", companiesRoutes);
router.use("/companywhatsapp", companywhatsappRoutes);
router.use("/companyemployees", companyemployeesRoutes);
//#endregion - company

//#region - common
router.use("/cities", citiesRoutes);
router.use("/plates", platesRoutes);
router.use("/vehicletypes", vehicletypesRoutes);
router.use("/cityplates", cityplatesRoutes);
//#endregion - common

//#region - transaction
router.use("/orders", ordersRoutes);
router.use("/orderaddresses", orderaddressesRoutes);
//#endregion - transaction

//#region - whatsapp
router.use("/chats", chatsRoutes);
router.use("/messages", messagesRoutes);
router.use("/message", messageRoutes);
router.use("/merchants", merchantsRoutes);
//#endregion - whatsapp

export default router;
