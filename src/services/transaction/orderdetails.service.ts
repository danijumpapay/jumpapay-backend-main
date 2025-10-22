import { transaction, common, service, customer } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrderDetailInput = Pick<
  transaction.OrderDetails,
  "order_id" | "service_id" | "name" | "price"
> &
  Partial<
    Pick<
      transaction.OrderDetails,
      | "vehicle_id"
      | "samsat_id"
      | "plate_prefix"
      | "plate_number"
      | "plate_serial"
      | "is_stnk_equals_ktp"
      | "is_stnk_equals_bpkb"
      | "is_same_location"
    >
  >;
type UpdateOrderDetailInput = Partial<Omit<transaction.OrderDetails, "id" | "created_at">>;
type OrderDetailRelationParams = {
  withOrder?: boolean;
  withService?: boolean;
  withVehicle?: boolean;
  withSamsat?: boolean;
  withFees?: boolean;
  withDocuments?: boolean;
};

interface FindAllOrderDetailsOptions {
  limit: number;
  offset: number;
  order_id?: string;
  service_id?: number;
  vehicle_id?: string;
  samsat_id?: number;
  sort?: string;
  withOrder?: boolean;
  withService?: boolean;
  withVehicle?: boolean;
  withSamsat?: boolean;
  withFees?: boolean;
  withDocuments?: boolean;
}

export class OrderDetailsService {
  async findAll({
    limit,
    offset,
    order_id,
    service_id,
    vehicle_id,
    samsat_id,
    sort,
    withOrder,
    withService,
    withVehicle,
    withSamsat,
    withFees,
    withDocuments,
  }: FindAllOrderDetailsOptions): Promise<Page<transaction.OrderDetails>> {
    const T_DETAILS = transaction.OrderDetails.tableName;
    let query = transaction.OrderDetails.query();

    if (order_id) query = query.where(`${T_DETAILS}.order_id`, order_id);
    if (service_id) query = query.where(`${T_DETAILS}.service_id`, service_id);
    if (vehicle_id) query = query.where(`${T_DETAILS}.vehicle_id`, vehicle_id);
    if (samsat_id) query = query.where(`${T_DETAILS}.samsat_id`, samsat_id);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "order_id", "service_id", "name", "price", "created_at"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${T_DETAILS}.${column}`
        : `${T_DETAILS}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${T_DETAILS}.created_at`, "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withService) eagerGraph.service = { $modify: ["selectServiceNameSlug"] };
    if (withVehicle) eagerGraph.vehicle = { $modify: ["selectVehicleInfo"] };
    if (withSamsat) eagerGraph.samsat = { $modify: ["selectSamsatName"] };
    if (withFees)
      eagerGraph.fees = {
        $modify: ["selectFeeDetails"],
        jumpapayFee: { $modify: ["selectFeeCodeNameGroup"] },
      };
    if (withDocuments) eagerGraph.documents = { $modify: ["selectDocumentInfo"] };

    const modifiers = {
      selectBasicOrder: (builder: QueryBuilder<transaction.Orders>) => {
        builder.select("id", "booking_id", "created_at").whereNull("deleted_at");
      },
      selectServiceNameSlug: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name", "slug").whereNull("deleted_at");
      },
      selectVehicleInfo: (builder: QueryBuilder<customer.Vehicles>) => {
        builder
          .select(
            `${customer.Vehicles.tableName}.id`,
            `${customer.Vehicles.tableName}.plate_number`,
            `${customer.Vehicles.tableName}.plate_serial`,
            `${customer.Vehicles.tableName}.brand`,
            `${customer.Vehicles.tableName}.model`
          )
          .whereNull(`${customer.Vehicles.tableName}.deleted_at`);
      },
      selectSamsatName: (builder: QueryBuilder<common.Samsat>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectFeeDetails: (builder: QueryBuilder<transaction.OrderDetailFees>) => {
        builder.select("id", "fee_name", "value", "jumpapay_fee_id");
      },
      selectFeeCodeNameGroup: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select("id", "code", "name", "jumpapay_fee_group_id")
          .withGraphFetched("group(selectGroupName)")
          .whereNull("deleted_at");
      },
      selectGroupName: (groupBuilder: QueryBuilder<common.JumpapayFeeGroups>) => {
        groupBuilder.select("id", "name").whereNull("deleted_at");
      },
      selectDocumentInfo: (builder: QueryBuilder<transaction.OrderDetailDocuments>) => {
        builder
          .select("id", "type", "document", "created_at", "uploaded_by")
          .orderBy("created_at", "DESC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const detailsPage: Page<transaction.OrderDetails> = await query.page(page, limit);
    return detailsPage;
  }

  async findOne(
    id: string,
    {
      withOrder,
      withService,
      withVehicle,
      withSamsat,
      withFees,
      withDocuments,
    }: OrderDetailRelationParams = {}
  ): Promise<transaction.OrderDetails> {
    let query = transaction.OrderDetails.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withService) eagerGraph.service = { $modify: ["selectServiceNameSlug"] };
    if (withVehicle) eagerGraph.vehicle = { $modify: ["selectVehicleInfo"] };
    if (withSamsat) eagerGraph.samsat = { $modify: ["selectSamsatName"] };
    if (withFees)
      eagerGraph.fees = {
        $modify: ["selectFeeDetails"],
        jumpapayFee: { $modify: ["selectFeeCodeNameGroup"] },
      };
    if (withDocuments) eagerGraph.documents = { $modify: ["selectDocumentInfo"] };

    const modifiers = {
      selectBasicOrder: (builder: QueryBuilder<transaction.Orders>) => {},
      selectServiceNameSlug: (builder: QueryBuilder<service.Services>) => {},
      selectVehicleInfo: (builder: QueryBuilder<customer.Vehicles>) => {},
      selectSamsatName: (builder: QueryBuilder<common.Samsat>) => {},
      selectFeeDetails: (builder: QueryBuilder<transaction.OrderDetailFees>) => {},
      selectFeeCodeNameGroup: (builder: QueryBuilder<common.JumpapayFees>) => {},
      selectGroupName: (groupBuilder: QueryBuilder<common.JumpapayFeeGroups>) => {},
      selectDocumentInfo: (builder: QueryBuilder<transaction.OrderDetailDocuments>) => {},
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const orderDetail = await query;
    if (!orderDetail) {
      throw new NotFoundError(`Order Detail with ID ${id} not found`);
    }
    return orderDetail;
  }

  async create(data: CreateOrderDetailInput, trx?: Transaction): Promise<transaction.OrderDetails> {
    const orderExists = await transaction.Orders.query(trx)
      .findById(data.order_id)
      .whereNull("deleted_at");
    if (!orderExists) throw new BadRequestError(`Order with ID ${data.order_id} not found.`);

    const serviceExists = await service.Services.query(trx)
      .findById(data.service_id)
      .whereNull("deleted_at");
    if (!serviceExists) throw new BadRequestError(`Service with ID ${data.service_id} not found.`);

    if (data.vehicle_id) {
      const vehicleExists = await customer.Vehicles.query(trx)
        .findById(data.vehicle_id)
        .whereNull("deleted_at");
      if (!vehicleExists)
        throw new BadRequestError(`Vehicle with ID ${data.vehicle_id} not found.`);
    }
    if (data.samsat_id) {
      const samsatExists = await common.Samsat.query(trx)
        .findById(data.samsat_id)
        .whereNull("deleted_at");
      if (!samsatExists) throw new BadRequestError(`Samsat with ID ${data.samsat_id} not found.`);
    }

    const detailData = {
      ...data,
    };

    const newDetail = await transaction.OrderDetails.query(trx).insert(detailData).returning("*");
    return Array.isArray(newDetail) ? newDetail[0] : newDetail;
  }

  async update(
    id: string,
    data: UpdateOrderDetailInput,
    trx?: Transaction
  ): Promise<transaction.OrderDetails> {
    const orderDetail = await transaction.OrderDetails.query(trx).findById(id);
    if (!orderDetail) {
      throw new NotFoundError(`Order Detail with ID ${id} not found`);
    }

    /*
    // NOT DONE YET
    if (data.order_id && data.order_id !== orderDetail.order_id) {
    }
    if (data.service_id && data.service_id !== orderDetail.service_id) {
    }
    if (data.vehicle_id && data.vehicle_id !== orderDetail.vehicle_id) {
    }
    if (data.samsat_id && data.samsat_id !== orderDetail.samsat_id) {
    }
    */

    const updatedDetails = await orderDetail.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedDetails) ? updatedDetails[0] : updatedDetails;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await transaction.OrderDetails.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Order Detail with ID ${id} not found`);
    }
    return { message: `Order Detail with ID ${id} deleted successfully` };
  }
}

export default new OrderDetailsService();
