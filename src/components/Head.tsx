import { graphql, useStaticQuery } from "gatsby";
import * as React from "react";
import styled from "styled-components";
import { removeUndefineds } from "utils/array";
import { replaceNullsWithUndefineds } from "utils/replace-nulls";

interface HeadProps {
    title?: string;
    description?: string;
}

export const DefaultHead: React.FC<React.PropsWithChildren<HeadProps>> = ({
    title,
    description,
    children,
}) => {
    const data = useStaticQuery<Queries.HeadQuery>(graphql`
        query Head {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `);

    const site = replaceNullsWithUndefineds(data.site);
    const siteTitle = site?.siteMetadata?.title;
    const pageTitle = removeUndefineds([siteTitle, title]).join(" | ");

    return (
        <>
            <title>{pageTitle}</title>
            {description && <meta name="description" content={description} />}
            <DefaultHTML />
            <DefaultBody />
            {children}
        </>
    );
};

const DefaultHTML = styled.html`
    /* Increase the root font size size a bit from the browser default of 16px
       to improve legibility. */
    font-size: 18px;
`;

const DefaultBody = styled.body`
    /* Reset the margin */
    margin: 0;

    /* Set the font */
    font-family: system-ui, sans-serif;
`;
