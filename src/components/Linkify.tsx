import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserLinkWithToolTip from "./UserLinkWithToolTip";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyUrl>
      <LinkifyUsername>
        <LinkifyHashTag>{children}</LinkifyHashTag>
      </LinkifyUsername>
    </LinkifyUrl>
  );
}

interface LinkifyUrlProps {
  children: React.ReactNode;
}

function LinkifyUrl({ children }: LinkifyUrlProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

interface LinkifyUsernameProps {
  children: React.ReactNode;
}

function LinkifyUsername({ children }: LinkifyUsernameProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithToolTip key={key} username={match.slice(1)}/>
      )}
    >
      {children}
    </LinkIt>
  );
}
interface LinkifyHashTagProps {
  children: React.ReactNode;
}

function LinkifyHashTag({ children }: LinkifyHashTagProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtag/${match.slice(1)}`}
          className="text-primary hover:underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
