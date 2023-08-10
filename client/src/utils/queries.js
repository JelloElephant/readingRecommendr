import gql from "graphql-tag"

export const GET_ME = gql`
    {
        me{
            _id
            username
            emial
            bookCount
            savedBooks {
                bookId
                authors
                image
                description
                title
                image
                link
            }
        }
    }
`