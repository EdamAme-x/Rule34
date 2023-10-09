import { Component, OnInit } from "@angular/core";
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from "@angular/platform-browser";
import { randomInt } from "./utils/randomInt";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "rule34";
  imageUrl: Element = "";
  id = "";
  image: SafeHtml = "";
  reloadInterval: number = 5000;

  changeIntervel(event: Event) {
    this.reloadInterval = parseInt((event.target as HTMLInputElement).value);
    localStorage.setItem("reloadInterval", this.reloadInterval.toString());
  }

  ngOnInit() {
    this.id = randomInt(1, 8000000).toString();
    if (typeof window == "undefined") return;

    if (!localStorage.getItem("reloadInterval")) {
      localStorage.setItem("reloadInterval", "5000");
    }

    fetch("/image/" + this.id)
      .then((res) => res.text())
      .then((text) => {
        this.imageUrl = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelectorAll("img#image")[0];

        if (typeof this.imageUrl.getAttribute("src") === null) {
          window.location.reload();
        }

        this.image = this.sanitizer.bypassSecurityTrustHtml(
          `<img id="image" src="${this.imageUrl
            .getAttribute("src")
            .replace("//samples", "/samples")}">`
        );

        setTimeout(() => {
          this.ngOnInit();
        }, this.reloadInterval);
      });
  }

  constructor(private sanitizer: DomSanitizer) {}
}
