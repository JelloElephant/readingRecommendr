const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
const { signTonke, signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userInfo = await User.findOne({ _id: context.user._id }).select('-__v -password')
                return userInfo
            }

            throw new AuthenticationError('Not logged in')
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })
            if (!user) {
                throw new AuthenticationError('Invalid login credentials')
            }

            const validPass = await user.isCorrectPassword(password)

            if (!validPass) {
                throw new AuthenticationError('Invalid login credentials')
            }

            const token = signToken(user)

            return { token, user }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token,user }
        },
        
        saveBook: async (parent, {input}, {User}) => {
            if (User) {
                const upUser = await User.findByIdAndUpdate(
                    { _id: User._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                )
                return upUser
            }
            throw new AuthenticationError('Must be logged in to save a Book')
        },

        removeBook: async(parent, {bookId},{User}) => {
            if (User) {
                const upUser = await User.findOneAndUpdate(
                    { _id: User._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true, runValidators: true}
                )
                return upUser
            }
            throw new AuthenticationError('Must be logged in to delete a Book')
        }
    }, 
}

module.exports = resolvers