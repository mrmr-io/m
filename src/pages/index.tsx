import CustomHead from "components/CustomHead";
import type { HeadFC, PageProps } from "gatsby";
import * as React from "react";
import styled from "styled-components";

const IndexPage: React.FC<PageProps> = () => {
    return (
        <Main>
            <div>
                <H1>mrmr</H1>
                <Poem />
            </div>
            <Items />
        </Main>
    );
};

export default IndexPage;

export const Head: HeadFC = () => {
    return (
        <CustomHead>
            <Body />
        </CustomHead>
    );
};

interface ItemType {
    text: string;
    href: string;
    color: string;
}

const items: ItemType[] = [
    {
        text: "come dream with me",
        href: "/come",
        color: "#3C1DFE",
    },
];

const Body = styled.body`
    margin: 0;

    background-color: hsl(0, 0%, 100%);
    color: hsl(0, 0%, 13%);
    --title-color: hsl(0, 0%, 18%);
    @media (prefers-color-scheme: dark) {
        background-color: hsl(240, 6%, 20%);
        color: hsl(240, 12%, 90%);
        --title-color: hsla(240, 12%, 85%);
    }
`;

const Main = styled.main`
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
`;

const H1 = styled.h1`
    margin-top: 0;
    padding-top: 40svh;
    font-size: 4rem;
    font-family: system-ui, sans-serif;
    margin-left: 1.8rem;
    margin-bottom: 0;
    color: var(--title-color);
`;

const Poem: React.FC = () => {
    return (
        <PoemC>
            <PoemText />
        </PoemC>
    );
};

const PoemC = styled.div`
    margin: 0svh 2rem;
    font-family: serif;
    display: flex;
`;

const PoemText: React.FC = () => {
    return (
        <p>
            <i>murmur</i> to me softly
            <br />
            &nbsp;&nbsp;tell me it is <i>all right</i>
            <br />
            in the <i>wind</i> rustle leaves
            <br />
            &nbsp;&nbsp;the moon, and the <i>night</i>
        </p>
    );
};

const Items: React.FC = () => {
    return (
        <ItemsUL>
            {items.map(({ href, color, text }) => (
                <ItemLI key={href} color={color}>
                    {text}
                </ItemLI>
            ))}
        </ItemsUL>
    );
};

const ItemsUL = styled.ul`
    padding: 4rem;

    list-style: none;
    font-family: system-ui, sans-serif;
    font-weight: 500;
`;

const ItemLI = styled.li`
    background-color: ${(props) => props.color};
    color: white;
    padding: 0.2rem 0.4rem;
`;
