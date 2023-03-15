import { Column } from "components/Column";
import { DefaultHead } from "components/Head";
import {
    createPageColorStyleProps,
    PageColorStyle,
} from "components/PageColorStyle";
import { ParsedLinkButtons } from "components/ParsedLinks";
import { graphql, HeadFC, PageProps } from "gatsby";
import { ParsedLink, parseUserLinks } from "parsers/links";
import { PageColors, parsePageColors } from "parsers/page-colors";
import * as React from "react";
import { ensure } from "utils/ensure";
import { replaceNullsWithUndefineds } from "utils/replace-nulls";

const UserPage: React.FC<PageProps<Queries.UserIndexQuery>> = ({
    data,
    children,
}) => {
    const user = parseUser(data);

    return (
        <main>
            <PageColorStyle {...createPageColorStyleProps(user)} />
            <Column>
                <Header {...user} />
                {children}
            </Column>
        </main>
    );
};

export default UserPage;

export const Head: HeadFC<Queries.UserIndexQuery> = ({ data }) => {
    const { name } = parseUser(data);

    return <DefaultHead title={name} />;
};

export const query = graphql`
    query UserIndex($username: String!) {
        allMdx(
            filter: { fields: { username: { eq: $username } } }
            sort: { frontmatter: { date: DESC } }
        ) {
            nodes {
                frontmatter {
                    name
                    title
                    colors
                    dark_colors
                    links
                }
                fields {
                    slug
                    template
                }
            }
        }
    }
`;

interface User {
    name: string;
    colors?: PageColors;
    darkColors?: PageColors;
    pages: Page[];
    links?: ParsedLink[];
}

interface Page {
    title: string;
    slug: string;
    colors?: PageColors;
    darkColors?: PageColors;
}

const parseUser = (data: Queries.UserIndexQuery) => {
    const allMdx = replaceNullsWithUndefineds(data.allMdx);
    const nodes = allMdx.nodes;

    let parsedUser: User | undefined;
    const pages: Page[] = [];
    nodes.forEach((node) => {
        const { frontmatter, fields } = node;
        const template = ensure(fields?.template);
        const colors = parsePageColors(frontmatter?.colors);
        const darkColors = parsePageColors(frontmatter?.dark_colors);

        if (template == "user") {
            const name = ensure(frontmatter?.name);
            const links = parseUserLinks(frontmatter?.links);

            parsedUser = { name, colors, darkColors, links, pages: [] };
        } else {
            const title = ensure(frontmatter?.title);
            const slug = ensure(fields?.slug);

            const page = { title, slug, colors, darkColors };

            pages.push(page);
        }
    });

    const user = ensure(parsedUser);
    return { ...user, pages };
};

const Header: React.FC<User> = ({ name, links }) => {
    return (
        <>
            <h1>{name}</h1>
            {links && <ParsedLinkButtons links={links} />}
        </>
    );
};
