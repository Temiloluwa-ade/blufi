import Image from "next/image";
import bmft_logo_ver from "../public/images/logo-BMFT-vertical.png";
import Link from "next/link";
import styled from "styled-components";

export function Footer() {
  return (
    <Container>
      <FooterImageWrapper>
        <Image src={bmft_logo_ver} alt={"Blufi"} />
      </FooterImageWrapper>
      <FooterText>
       Built with love by Temi and Joel
      </FooterText>
    </Container>
  );
}

const Container = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.gutter.xl};
  color: ${({ theme }) => theme.colors.white};
  padding: 8em 0;
`;

const FooterImageWrapper = styled.div`
  margin-bottom: 2em;
  height: 5rem;
  width: 10rem;
  position: relative;
`;

const FooterText = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 21px;
  padding: 2rem;
  text-align: center;

  color: ${({ theme }) => theme.colors.white};
`;
