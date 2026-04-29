import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

/**
 * O(log n) sum/count over `agentEmployees.trust`. Used by the operations
 * dashboard to render company-wide trust without scanning every row.
 *
 * No namespace partitioning to keep the demo simple — call with the
 * single default namespace and the convenience wrappers in
 * `convex/trustLedger.ts` hide the parameter.
 */
export const trustAggregate = new TableAggregate<{
  Key: number;
  DataModel: DataModel;
  TableName: "agentEmployees";
}>(components.aggregate, {
  sortKey: (doc) => doc.trust,
  sumValue: (doc) => doc.trust,
});
