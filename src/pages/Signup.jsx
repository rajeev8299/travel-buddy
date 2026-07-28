import PageHeader from "../components/PageHeader";
import AuthForm from "../components/AuthForm";
import { AUTH, asset } from "../data";
import { useReveal } from "../hooks";

export default function Signup() {
  const pageRef = useReveal();
  const { title, intro } = AUTH.signup;

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow={AUTH.signup.eyebrow}
        title={title}
        intro={intro}
        image={asset("img/harbour.jpg")}
        pos="center 50%"
      />

      <section className="section section--tint">
        <div className="shell auth__shell" data-reveal>
          <AuthForm mode="signup" />
        </div>
      </section>
    </div>
  );
}
