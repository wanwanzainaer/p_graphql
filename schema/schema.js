const graphql = require("graphql");
const _ = require("lodash");
const axios = require("axios").create({
  baseURL: "http://localhost:3000"
});

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        const { data } = await axios.get(
          `/companies/${parentValue.id}/users`
        );
        return data;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        const { data } = await axios.get(
          `/companies/${parentValue.companyId}`
        );
        return data;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const { data } = await axios.get(`/users/${args.id}`);
        return data;
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const { data } = await axios.get(`/companies/${args.id}`);
        return data;
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, { firstName, age }) {
        try {
          const { data } = await axios.post("/users", {
            firstName,
            age
          });
          return data;
        } catch (e) {
          return e;
        }
      }
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: GraphQLNonNull(GraphQLString) } },
      async resolve(parentValue, args) {
        try {
          const { data } = await axios.delete(`/users/${args.id}`);
          return data;
        } catch (e) {
          return e;
        }
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, args) {
        try {
          const { data } = await axios.patch(`/users/${args.id}`, {
            ...args
          });
          return data;
        } catch (e) {
          return e;
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
