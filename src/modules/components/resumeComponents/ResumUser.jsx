import { Widget4, } from "@panely/components";
import Link from "next/link";


export function ResumUser({ user, runnerCurrent, userId, leaderUser }) {
    console.log("🚀 ~ file: ResumUser.jsx:6 ~ ResumUser ~ leaderUser", leaderUser)
    console.log("🚀 ~ file: ResumUser.jsx:6 ~ ResumUser ~  runnerCurrent",  runnerCurrent)
    if (!leaderUser?.profile) {
        return <span>...</span>
    }
    return (
        <>
            <Widget4>
                <Widget4.Group>
                    <Widget4.Display>
                        <img src={user.image} className="float-left mr-3  avatar-circle"></img>
                        <Widget4.Title children={<Link href={"/user?uid=" + userId}>{user.displayName}</Link>} />
                        {leaderUser.profile !== "trainee" && (
                            <Widget4.Subtitle children={user.email.substring(0, user.email.indexOf("@"))} />
                        )}
                        <Widget4.Subtitle children={<strong>{runnerCurrent}</strong>} />
                    </Widget4.Display>
                    <Widget4.Addon>
                        <Widget4.Highlight className={`text-info`} children={""} />
                    </Widget4.Addon>
                </Widget4.Group>
            </Widget4>
        </>
    );
}
