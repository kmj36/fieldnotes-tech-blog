import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ReactNode } from "react";
import { C } from "../constants";

interface CodeProps {
    className?: string;
    children?: ReactNode;
}

export const markdownComponents = {
    hr() {
        return <hr style={{ border: "none", borderTop: `2px solid ${C.border}`, margin: "2rem 0" }} />;
    },
    code({ className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className ?? "");
        const codeString = Array.isArray(children)
        ? children.join("")
        : String(children ?? "");

        return match ? (
        <SyntaxHighlighter
            style={oneDark}
            language={match[1].toLowerCase()}
            PreTag="div"
        >
            {codeString.replace(/\n$/, "")}
        </SyntaxHighlighter>
        ) : (
        <code className={className} {...props}>
            {children}
        </code>
        );
    },
};