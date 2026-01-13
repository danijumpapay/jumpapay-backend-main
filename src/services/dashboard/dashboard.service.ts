// import { transaction, user } from "@jumpapay/jumpapay-models";
// import { NotFoundError, BadRequestError } from "@utils/errors";
// import { Page, QueryBuilder, Transaction } from "objection";
// import path from "path";


// interface GetServiceUsageSummaryOptions extends CourierEvidenceRelationParams {
//   limit: number;
//   offset: number;
//   service_id?: string;
//   sort?: string;
// }

// export class DashboardService {
//   private T_SERVICE_USAGE = transaction.VServiceUsageStats.tableName;

//   async getServiceUsageSummary({
//     limit,
//     offset,
//     service_id,
//     sort,
//   }: GetServiceUsageSummaryOptions): Promise<Page<transaction.VServiceUsageStats>> {
//     let query = transaction.VServiceUsageStats.query();

//     query = query.where(`${this.T_SERVICE_USAGE}.order_id`, order_id);
//     if (user_id) query = query.where(`${this.T_SERVICE_USAGE}.user_id`, user_id);
//     if (delivery_type) query = query.where(`${this.T_SERVICE_USAGE}.delivery_type`, delivery_type);

//     if (sort) {
//       const [column, direction] = sort.split(":");
//       const allowedSortColumns = ["id", "user_id", "delivery_type", "created_at"];
//       const sortColumn = allowedSortColumns.includes(column)
//         ? `${this.T_SERVICE_USAGE}.${column}`
//         : `${this.T_SERVICE_USAGE}.created_at`;
//       if (["asc", "desc"].includes(direction.toLowerCase())) {
//         query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
//       }
//     } else {
//       query = query.orderBy(`${this.T_SERVICE_USAGE}.created_at`, "DESC");
//     }

//     const eagerGraph: Record<string, any> = {};
//     const modifiers = this.getEagerModifiers();
//     if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
//     if (withUser) eagerGraph.user = { $modify: ["selectUserInfo"] };

//     if (Object.keys(eagerGraph).length > 0) {
//       query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
//     }

//     const page = Math.floor(offset / limit);
//     const evidencesPage: Page<transaction.CourierEvidences> = await query.page(page, limit);
//     return evidencesPage;
//   }
// }

// export default new DashboardService();
