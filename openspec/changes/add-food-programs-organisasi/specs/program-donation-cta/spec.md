## ADDED Requirements

### Requirement: Program page renders a CTA appropriate to its package type
The `/program/[program]` page SHALL render one of two CTA variants based on the program's package type: a self-serve donation panel (fixed price, immediate WhatsApp donation link) for programs with a fixed package, or an inquiry CTA ("Diskusikan Program") for programs with a custom/negotiated package.

#### Scenario: Fixed-package program shows self-serve panel
- **WHEN** a visitor views the page for a program with a fixed package (e.g. Jumat Berkah)
- **THEN** the page SHALL show the price panel with a "Donasi Sekarang" button linking to a pre-filled WhatsApp donation message

#### Scenario: Custom-package program shows inquiry CTA
- **WHEN** a visitor views the page for a program with a custom/negotiated package (e.g. Community Giving, CSR Food Program)
- **THEN** the page SHALL show a "Diskusikan Program {label}" button linking to a WhatsApp inquiry message, and SHALL NOT show the fixed-price self-serve panel

### Requirement: Multi-package self-serve program requires a package selection before donating
For a self-serve program that offers more than one fixed package (e.g. Ramadhan Berbagi: Sahur, Takjil, Buka Puasa), the page SHALL require the visitor to select one package before the donation link is built.

#### Scenario: Donation link reflects the selected package
- **WHEN** a visitor selects "Takjil" on the Ramadhan Berbagi page and proceeds to donate
- **THEN** the generated WhatsApp donation message SHALL reference the selected package, not a generic or default one
