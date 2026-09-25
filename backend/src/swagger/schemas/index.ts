import { commonSchemas } from "./common.swagger";
import { organizationSchemas } from "./organization.swagger";
import { countrySchemas } from "./country.swagger";
import { currencySchemas } from "./currency.swagger";
import { departmentSchemas } from "./department.swagger";
import { employeeSchemas } from "./employee.swagger";
import { salarySchemas } from "./salary.swagger";
import { authSchemas } from "./auth.swagger";
import { reportSchemas } from "./report.swagger";
import { dashboardSchemas } from "./dashboard.swagger";

export const swaggerSchemas = {
  ...commonSchemas,
  ...organizationSchemas,
  ...countrySchemas,
  ...currencySchemas,
  ...departmentSchemas,
  ...employeeSchemas,
  ...salarySchemas,
  ...authSchemas,
  ...reportSchemas,
  ...dashboardSchemas,
};

export default swaggerSchemas;
