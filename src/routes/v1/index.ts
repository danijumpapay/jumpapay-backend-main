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
import companiesRoutes from "../v1/company/companiesRoutes";
import companywhatsappRoutes from "../v1/company/companywhatsappRoutes";
import companyemployeesRoutes from "../v1/company/companyemployeesRoutes";
import chatsRoutes from "@routes/v1/chats";
import messagesRoutes from "@routes/v1/messages";
import messageRoutes from "@routes/v1/message";
import merchantsRoutes from "@routes/v1/merchants";
import authRoutes from "./auth";
import ssoRoutes from "./sso";

//#region - Schema Common
import citiesRoutes from "./common/citiesRoutes";
import provincesRoutes from "./common/provincesRoutes";
import platesRoutes from "./common/platesRoutes";
import vehicleTypesRoutes from "./common/vehicletypesRoutes";
import orderStatusRoutes from "./common/orderstatusRoutes";
import paymentMethodsRoutes from "./common/paymentmethodsRoutes";
import samsatRoutes from "./common/samsatRoutes";
import jumpapayFeeGroupsRoutes from "./common/jumpapayfeegroupsRoutes";
import jumpapayFeesRoutes from "./common/jumpapayfeesRoutes";
import cityPlatesRoutes from "./common/cityplatesRoutes";
import jumpapayFeeServicesRoutes from "./common/jumpapayfeeservicesRoutes";
//#endregion - Schema Common

//#region - Schema Service
import modulegroupsRoutes from "./service/modulegroupsRoutes";
import modulesRoutes from "./service/modulesRoutes";
import servicesRoutes from "./service/servicesRoutes";
import apiscopesRoutes from "./service/apiscopesRoutes";
import accesstokensRoutes from "./service/accesstokensRoutes";
import tokenscopesRoutes from "./service/tokenscopesRoutes";
import servicehtmlformRoutes from "./service/servicehtmlformRoutes";
import serviceformordersRoutes from "./service/serviceformordersRoutes";
import serviceformdocumentsRoutes from "./service/serviceformdocumentsRoutes";
//#endregion - Schema Service

//#region - Schema Transaction
import ordersRoutes from "./transaction/ordersRoutes";
import orderdetailsRoutes from "./transaction/orderdetailsRoutes";
import orderdetailfeesRoutes from "./transaction/orderdetailfeesRoutes";
import orderdetaildocumentsRoutes from "./transaction/orderdetaildocumentsRoutes";
import orderformdatasRoutes from "./transaction/orderformdatasRoutes";
import paymentsRoutes from "./transaction/paymentsRoutes";
import orderaddressesRoutes from "./transaction/orderaddressesRoutes";
import paymentitemsRoutes from "./transaction/paymentitemsRoutes";
//#endregion - Schema Transaction

const router = Router();

router.use("/sso", ssoRoutes);
router.use("/auth", authRoutes);

//#region - common
router.use("/cities", citiesRoutes);
router.use("/provinces", provincesRoutes);
router.use("/plates", platesRoutes);
router.use("/vehicle-types", vehicleTypesRoutes);
router.use("/order-status", orderStatusRoutes);
router.use("/payment-methods", paymentMethodsRoutes);
router.use("/samsat", samsatRoutes);
router.use("/jumpapay-fee-groups", jumpapayFeeGroupsRoutes);
router.use("/jumpapay-fees", jumpapayFeesRoutes);
router.use("/city-plates", cityPlatesRoutes);
router.use("/jumpapay-fee-services", jumpapayFeeServicesRoutes);
//#endregion - common

//#region - service
router.use("/module-groups", modulegroupsRoutes);
router.use("/modules", modulesRoutes);
router.use("/services", servicesRoutes);
router.use("/api-scopes", apiscopesRoutes);
router.use("/access-tokens", accesstokensRoutes);
router.use("/token-scopes", tokenscopesRoutes);
router.use("/service-html-forms", servicehtmlformRoutes);
router.use("/service-form-orders", serviceformordersRoutes);
router.use("/service-form-documents", serviceformdocumentsRoutes);
//#endregion - service

//#region - transaction
router.use("/orders", ordersRoutes);
router.use("/order-details", orderdetailsRoutes);
router.use("/order-detail-fees", orderdetailfeesRoutes);
router.use("/order-detail-documents", orderdetaildocumentsRoutes);
router.use("/order-addresses", orderaddressesRoutes);
router.use("/order-form-datas", orderformdatasRoutes);
router.use("/payments", paymentsRoutes);
router.use("/payment-items", paymentitemsRoutes);
//#endregion - transaction

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

//#region - whatsapp
router.use("/chats", chatsRoutes);
router.use("/messages", messagesRoutes);
router.use("/message", messageRoutes);
router.use("/merchants", merchantsRoutes);
//#endregion - whatsapp

export default router;
