import { commonSchemas } from "./common.swagger";
import { organizationSchemas } from "./organization.swagger";
import { countrySchemas } from "./country.swagger";
import { currencySchemas } from "./currency.swagger";
import { departmentSchemas } from "./department.swagger";
import { employeeSchemas } from "./employee.swagger";
import { salarySchemas } from "./salary.swagger";

export const swaggerSchemas = {
  ...commonSchemas,
  ...organizationSchemas,
  ...countrySchemas,
  ...currencySchemas,
  ...departmentSchemas,
  ...employeeSchemas,
  ...salarySchemas,
};

export default swaggerSchemas;
