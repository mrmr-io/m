import { graphql, useStaticQuery } from "gatsby";
import * as React from "react";
import { removeUndefineds } from "utils/array";
import { replaceNullsWithUndefineds } from "utils/replace-nulls";

interface CustomHeadProps {
    title?: string;
    description?: string;
}

const CustomHead: React.FC<React.PropsWithChildren<CustomHeadProps>> = ({
    title,
    description,
    children,
}) => {
    const data = useStaticQuery<Queries.CustomHeadQuery>(graphql`
        query CustomHead {
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
            {children}
        </>
    );
};

export default CustomHead;
