import { DefaultHead } from "components/Head";
import PageListingContent, {
    parsePageListingPage,
    type PageListingPage,
} from "components/PageListingContent";
import { PageProps, graphql, type HeadFC } from "gatsby";
import { parseColor } from "parsers/colors";
import { type Tag } from "parsers/tag";
import * as React from "react";
import styled from "styled-components";
import { ensure } from "utils/ensure";
import { replaceNullsWithUndefineds } from "utils/replace-nulls";
import { capitalize } from "utils/string";

/**
 * A template page for showing the list of pages with the given tag.
 *
 * At build time, Gatsby will build one of these at "/t/{tag.tag}" for each of
 * the tags defined in `data/tags.yaml`.
 */
const TagListingPage: React.FC<PageProps<Queries.TagListingPageQuery>> = ({
    data,
}) => {
    const pages = parsePages(data);
    const tag = parseTag(data);

    return (
        <PageListingContent pages={pages}>
            <Title_ {...tag}>{tag.tag}</Title_>
        </PageListingContent>
    );
};

export default TagListingPage;

const Title_ = styled.div<Tag>`
    color: ${(props) => props.color ?? "var(--mrmr-color-4)"};
`;

export const Head: HeadFC<Queries.TagListingPageQuery> = ({ data }) => {
    const { tag, slug } = parseTag(data);

    // All the tag values are single words, and so here we can use it as a the
    // "name" for the tag, and also show it in the description.
    const titlePrefix = capitalize(tag);
    const description = `Listing of all pages tagged ${tag} on mrmr.io`;
    const canonicalPath = slug;

    return <DefaultHead {...{ titlePrefix, description, canonicalPath }} />;
};

/**
 * Fetch all pages with the given tag, sorted by recency.
 *
 * - Exclude the pages which are marked `unlisted`.
 */
export const query = graphql`
    query TagListingPage($tag: String!) {
        allMdx(
            filter: {
                frontmatter: {
                    tags: { elemMatch: { tag: { tag: { eq: $tag } } } }
                    unlisted: { ne: true }
                }
            }
            sort: [
                { frontmatter: { date: DESC } }
                { frontmatter: { title: ASC } }
            ]
        ) {
            nodes {
                ...PageListingPageData
            }
        }
        tagsYaml(tag: { eq: $tag }) {
            tag
            color
            fields {
                slug
            }
        }
    }
`;

const parsePages = (data: Queries.TagListingPageQuery): PageListingPage[] =>
    replaceNullsWithUndefineds(data.allMdx).nodes.map(parsePageListingPage);

/**
 * Convert the tag data we get from GraphQL into the {@link Tag} type that the
 * rest of our code uses.
 */
const parseTag = (data: Queries.TagListingPageQuery): Tag => {
    const tagsYaml = ensure(replaceNullsWithUndefineds(data.tagsYaml));

    const tag = ensure(tagsYaml.tag);
    const slug = ensure(tagsYaml.fields?.slug);
    const color = parseColor(tagsYaml.color);

    return { tag, slug, color };
};
