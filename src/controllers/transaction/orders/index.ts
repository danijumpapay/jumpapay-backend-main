import { Request, Response, NextFunction } from "express";
import ordersService from "@services/transaction/orders.service";
import usersService from "@services/user/users.service";
import vehiclesService from "@services/customer/vehicles.service";
import OrderDetailsService from "@services/transaction/orderdetails.service";
import OrderDetailDocumentsService from "@services/transaction/orderdetaildocuments.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";
import { generateId, extractPlate } from "@utils/helpers";

interface RequestWithUser extends Request {
  user?: any;
}

type DocumentTypeValue = "STNK" | "BPKB" | "SKPD" | "KTP" | "OTHERS";

export const findAllOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withUser: query.withUser,
      withCompany: query.withCompany,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2COrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CUnpaidOrders = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isPaid: false,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CPaidOrders = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isPaid: true,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CCompletedOrders = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isCompleted: true,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

// not finished yet
export const findAllB2BOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withUser: query.withUser,
      withCompany: query.withCompany,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findB2COrderById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = await ordersService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const orderId = generateId("dashboard");
    const bookingId = generateId("B");
    const { name, vehicle_type_id, plate, ...orderDataBody } = req.body;
    const uploadedFiles: any = req.files || {};
    
    const dataUser = {
      id: generateId("user_dashboard"),
      name: name,
      role: "CUSTOMER" as const, 
      phone: req.body.phone,
      is_active: true,
    };
    
    const newUser = await usersService.create(dataUser, trx);
    const plates = extractPlate(req.body.plate || "");

    const dataVehicle = {
          id: generateId("V"),
          user_id: newUser.id,
          vehicle_type_id: vehicle_type_id,
          plate_id: 1,
          plate_number: plates?.number,
          plate_serial: plates?.serial,
    };

    const newVehicle = await vehiclesService.create(dataVehicle, trx);

    const dataOrder = {
      ...orderDataBody,
      id: orderId,
      user_id: newUser.id,
      order_status_id: 1,
      order_position: "VERIFICATION",
      booking_id: bookingId
    };

    const newOrder = await ordersService.create(dataOrder, trx);
  
    const dataOrderDetail = {
      id: generateId("OD"),
      order_id: newOrder.id,
      service_id: 2,
      vehicle_id: newVehicle.id,
      price: req.body.price,
      is_stnk_equals_ktp: true,
      is_stnk_equals_bpkb: true,
      is_same_location: true,
      name: name,
      plate_prefix: plates?.prefix,
      plate_number: plates?.number,
      plate_serial: plates?.serial,
    };
    
    await OrderDetailsService.create(dataOrderDetail, trx);
    const orderDetailId = dataOrderDetail.id;
    const userId = newUser.id;

    const documentTypesMap = {
      ktpFile: "KTP" as DocumentTypeValue,   
      stnkFile: "STNK" as DocumentTypeValue,
      bpkbFile: "BPKB" as DocumentTypeValue,
      skpdFile: "SKPD" as DocumentTypeValue,
    };

    const documentPromises: Promise<any>[] = [];

    for (const [fieldName, docType] of Object.entries(documentTypesMap)) {
        const file = uploadedFiles[fieldName]; 
        
        if (file && Array.isArray(file) && file[0]) {
            const fileData = file[0] as Express.MulterS3.File;
            const documentLocation = fileData.location; 
            
            const documentData = {
                order_detail_id: orderDetailId,
                uploaded_by: userId,
                type: docType,
                document: documentLocation,
            };
            
            documentPromises.push(OrderDetailDocumentsService.create(documentData, trx));
        }
    }

    await Promise.all(documentPromises);
    await trx.commit();
    const createdOrder = await ordersService.findOne(newOrder.id);
    successResponse(res, 201, createdOrder, "Order created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedOrder = await ordersService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedOrder, "Order updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await ordersService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {

};