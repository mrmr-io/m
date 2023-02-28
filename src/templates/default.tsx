import { css } from "@emotion/react";
import CustomHead from "components/CustomHead";
import { graphql, HeadFC, PageProps } from "gatsby";
import React from "react";
import type { Context } from "types";
import { replaceNullsWithUndefineds } from "utils/replace-nulls";

const Page: React.FC<PageProps<Queries.DefaultPageQuery, Context>> = ({
    data,
    children,
}) => {
    const { title } = parseData(data);

    return (
        <main>
            <h1
                css={css`
                    font-family: -apple-system-font, system-ui, sans-serif;
                    text-decoration: underline;
                `}
            >
                {title}
            </h1>
            {children}
        </main>
    );
};

export default Page;

export const Head: HeadFC<Queries.DefaultPageQuery, Context> = ({ data }) => {
    const pd = parseData(data);

    return (
        <CustomHead title={pd.title}>
            <body css={bodyCSS(pd)} />
        </CustomHead>
    );
};

export const query = graphql`
    query DefaultPage($id: String!) {
        mdx(id: { eq: $id }) {
            frontmatter {
                title
                colors
            }
        }
    }
`;

interface ParsedData {
    title: string;
    backgroundColor: string;
    foregroundColor: string;
}

const parseData = (data: Queries.DefaultPageQuery) => {
    const mdx = replaceNullsWithUndefineds(data.mdx);

    const title = mdx?.frontmatter?.title;
    if (!title) {
        throw new Error("Required `title` property is missing in page query");
    }

    const { backgroundColor, foregroundColor } = parseColors(
        mdx?.frontmatter?.colors
    );

    return { title, backgroundColor, foregroundColor };
};

const parseColors = (colors: readonly (string | undefined)[] | undefined) => {
    if (!colors) {
        throw new Error("Required `colors` property is missing in page query");
    }

    if (colors.length < 2) {
        throw new Error(
            "At least 2 `colors` are required by the default template"
        );
    }

    const backgroundColor = colors[0];
    if (!backgroundColor) {
        throw new Error("Background color is required by the default template");
    }

    const foregroundColor = colors[1];
    if (!foregroundColor) {
        throw new Error("Foreground color is required by the default template");
    }

    return { backgroundColor, foregroundColor };
};

const bodyCSS = (pd: ParsedData) => {
    const { backgroundColor, foregroundColor } = pd;
    return css`
        /* Reset the margin */
        margin: 0;

        /* Set the colors as per the MDX frontmatter */
        background-color: ${backgroundColor};
        color: ${foregroundColor};

        /* Set the font */
        * {
            font-family: Arial, system-ui, sans-serif;
        }
    `;
};
