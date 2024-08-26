import StartRecover from "@/components/password-recover/StartRecover";
import SecretQuestion from "@/components/password-recover/SecretQuestion";
import NewPassword from "@/components/password-recover/NewPassword";
import TwoFactor from "@/components/password-recover/TwoFactor";
import AditionalTwoFactor from "@/components/password-recover/AditionalTwoFactor";
import Congratulation from "@/components/password-recover/Congratulations";

export default function Page() {
    return (
        <section>
            <SecretQuestion />
        </section>
    )
}