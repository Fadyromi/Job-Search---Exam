import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLID,
} from "graphql";
import User from "../../models/User.js";
import Company from "../../models/Company.js";

// Define User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    gender: { type: GraphQLString },
    DOB: { type: GraphQLString },
    role: { type: GraphQLString },
    isConfirmed: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
  },
});

// Define Company Type
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLString },
  },
});

// Define Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find();
      },
    },
    companies: {
      type: new GraphQLList(CompanyType),
      resolve(parent, args) {
        return Company.find();
      },
    },
  },
});

// Export the schema
export default new GraphQLSchema({
  query: RootQuery,
});
